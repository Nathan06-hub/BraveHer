package com.braveher.backend.dto.response;

import java.util.List;
import java.util.UUID;

public record SyncResponse(
        int totalRecues,
        int totalAcceptees,
        int totalDupliquees,
        int totalErreurs,
        List<UUID> clientUuidsAcceptees,
        List<UUID> clientUuidsDupliquees,
        List<String> detailsErreurs
) {}
