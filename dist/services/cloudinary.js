"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = void 0;
exports.storeImage = storeImage;
exports.deleteImage = deleteImage;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
async function storeImage(input, publicId) {
    let buffer;
    if (input instanceof File) {
        const arrayBuffer = await input.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
    }
    else {
        buffer = input;
    }
    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            resource_type: "auto",
            ...(publicId && {
                public_id: publicId,
                overwrite: true,
            }),
        }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result);
        });
        stream.end(buffer);
    });
    return result.secure_url;
}
async function deleteImage(secureUrl) {
    const matches = secureUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
    if (!matches || !matches[1]) {
        throw new Error("Could not extract public_id from the URL.");
    }
    const publicId = matches[1];
    await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: "image" });
}
//# sourceMappingURL=cloudinary.js.map