import request from "supertest";
import app from "../app.js";
import authModel from "../src/models/auth.model.js";

const userInput = {
    displayName: "Test User",
    email: "test@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    encryptedAESKey: "encryptedAESKey",
    passwordKeySalt: "passwordKeySalt",
};

let token;
let userId;

describe("Update Encryption Status Validation", () => {
    beforeEach(async () => {
        // Create user
        const res = await request(app).post("/api/v1/auth/signup").send(userInput);
        token = res.body.token;
        if (res.body.data) {
            userId = res.body.data.id;
        }
    });

    it("should fail to set status to ENCRYPTED if keys are missing", async () => {
        // Force keys to be null using $unset
        await authModel.findOneAndUpdate({ user: userId }, {
            $unset: {
                encryptedAESKey: 1,
                passwordKeySalt: 1
            },
            $set: {
                encryptionStatus: "UNENCRYPTED"
            }
        }, { new: true });

        const res = await request(app)
            .post("/api/v1/auth/update-encryption-status")
            .set("Authorization", `Bearer ${token}`)
            .send({ encryptionStatus: "ENCRYPTED" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Cannot set status to ENCRYPTED without encryption keys.");
    });

    it("should succeed to set status to ENCRYPTED if keys are present", async () => {
        // Ensure keys are present (signup sets them by default)

        // Let's explicitly set to MIGRATED with keys first
        await authModel.findOneAndUpdate({ user: userId }, {
            encryptedAESKey: "validKey",
            passwordKeySalt: "validSalt",
            encryptionStatus: "MIGRATED"
        });

        const res = await request(app)
            .post("/api/v1/auth/update-encryption-status")
            .set("Authorization", `Bearer ${token}`)
            .send({ encryptionStatus: "ENCRYPTED" });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Encryption status updated successfully.");
    });
});
