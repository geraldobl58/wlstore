package com.wlstore.common.tenant;

import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.UUID;

public class RequestTenantResolver implements CurrentTenantIdentifierResolver<UUID> {

    public static final UUID DEFAULT_TENANT = new UUID(0L, 0L);

    @Override
    public UUID resolveCurrentTenantIdentifier() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();

        if (attrs != null
                && attrs.getAttribute(TenantFilter.ATTRIBUTE, RequestAttributes.SCOPE_REQUEST)
                instanceof UUID tenantId) {
            return tenantId;
        }
        return DEFAULT_TENANT;
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }
}