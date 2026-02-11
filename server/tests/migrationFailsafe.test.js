import request from "supertest";
import app from "../app.js";
import authModel from "../src/models/auth.model.js";
import userModel from "../src/models/user.model.js";

const userInput = {
    displayName: "Failsafe User",
    email: "failsafe@example.com",
    password: "Password123!",
};

let token;
let userId;

describe("Encryption Migration Failsafe", () => {
    beforeEach(async () => {
        // Clean up
        await userModel.deleteOne({ email: userInput.email });

        // Create user (unencrypted)
        const signupRes = await request(app).post("/api/v1/auth/signup").send({
            ...userInput,
            confirmPassword: userInput.password,
            encryptedAESKey: "dummy",
            passwordKeySalt: "dummy"
        });

        if (signupRes.status !== 201) {
            throw new Error(`Signup failed: ${signupRes.body.message}`);
        }

        token = signupRes.body.token;
        userId = signupRes.body.data.id || signupRes.body.data._id;

        // Manually set to UNENCRYPTED and remove keys to simulate legacy user
        await authModel.findOneAndUpdate({ user: userId }, {
            $unset: {
                encryptedAESKey: 1,
                passwordKeySalt: 1
            },
            $set: {
                encryptionStatus: "UNENCRYPTED"
            }
        });
    });

    it("should allow initial migration and save keys", async () => {
        const migrationPayload = {
            password: userInput.password,
            encryptedAESKey: "key_v1",
            passwordKeySalt: "salt_v1"
        };

        const res = await request(app)
            .post("/api/v1/auth/migrate-encryption")
            .set("Authorization", `Bearer ${token}`)
            .send(migrationPayload);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Encryption migrated successfully.");

        const auth = await authModel.findOne({ user: userId });
        expect(auth.encryptedAESKey).toBe("key_v1");
        expect(auth.passwordKeySalt).toBe("salt_v1");
        expect(auth.encryptionStatus).toBe("MIGRATED");
    });

    it("should NOT overwrite keys on second migration attempt and return existing keys", async () => {
        // PRE-CONDITION: User is already migrated with v1 keys
        await authModel.findOneAndUpdate({ user: userId }, {
            encryptedAESKey: "key_v1",
            passwordKeySalt: "salt_v1",
            encryptionStatus: "MIGRATED"
        });

        const secondMigrationPayload = {
            password: userInput.password,
            encryptedAESKey: "key_v2_attempt",
            passwordKeySalt: "salt_v2_attempt"
        };

        const res = await request(app)
            .post("/api/v1/auth/migrate-encryption")
            .set("Authorization", `Bearer ${token}`)
            .send(secondMigrationPayload);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("User already migrated. Syncing existing keys.");
        expect(res.body.data.encryptedAESKey).toBe("key_v1");
        expect(res.body.data.passwordKeySalt).toBe("salt_v1");

        // Verify database still has v1 keys
        const auth = await authModel.findOne({ user: userId });
        expect(auth.encryptedAESKey).toBe("key_v1");
        expect(auth.passwordKeySalt).toBe("salt_v1");
    });

    it("should fail migration if password is wrong", async () => {
        const res = await request(app)
            .post("/api/v1/auth/migrate-encryption")
            .set("Authorization", `Bearer ${token}`)
            .send({
                password: "WrongPassword!",
                encryptedAESKey: "ignored",
                passwordKeySalt: "ignored"
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Wrong password. Verification failed.");
    });
});
