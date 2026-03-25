package com.knowted.KnowtedBackend.presentation.dto;

import java.time.Instant;

public record DownloadUrlResponse(
        String presignedUrl,
        Instant expiresAt
) {
}
