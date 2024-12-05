const modelOptions = {
    toJSON: {
        virtuals: true,
        transform: (_, obj) => {
            delete obj._id;
            delete obj.password;
            return obj;
        },
    },
    toObject: {
        virtuals: true,
        transform: (_, obj) => {
            delete obj._id;
            delete obj.password;
            return obj;
        },
    },
    versionKey: false,
    timestamps: true,
};

export default modelOptions;