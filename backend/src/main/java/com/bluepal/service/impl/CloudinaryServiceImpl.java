package com.bluepal.service.impl;

import com.bluepal.service.interfaces.CloudinaryService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryServiceImpl(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    private static final String FOLDER_PARAM = "folder";

    @Override
    public Map<String, String> generateSignedUploadUrl(String folder) {
        try {
            String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
            Map<String, Object> params = ObjectUtils.asMap(
                    "timestamp", timestamp,
                    FOLDER_PARAM, folder
            );
            String signature = cloudinary.apiSignRequest(params, cloudinary.config.apiSecret);
            return Map.of(
                    "signature", signature,
                    "timestamp", timestamp,
                    "apiKey", cloudinary.config.apiKey,
                    "cloudName", cloudinary.config.cloudName,
                    FOLDER_PARAM, folder
            );
        } catch (Exception e) {
            throw new RuntimeException("Could not generate Cloudinary signature", e);
        }
    }

    @Override
    public String uploadImage(MultipartFile file, String folder) {
        try {
            java.util.Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(FOLDER_PARAM, folder));
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

    @Override
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete image from Cloudinary", e);
        }
    }
}
