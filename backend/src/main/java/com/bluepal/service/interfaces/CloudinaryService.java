package com.bluepal.service.interfaces;

import java.util.Map;

public interface CloudinaryService {
    Map<String, String> generateSignedUploadUrl(String folder);
    void deleteImage(String publicId);
}
