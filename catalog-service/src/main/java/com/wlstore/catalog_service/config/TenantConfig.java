package com.wlstore.catalog_service.config;

import org.hibernate.cfg.AvailableSettings;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Configuration
public class TenantConfig {
    public static final UUID DEFAULT_TENANT = new UUID(0L, 0L);

    @Bean
    CurrentTenantIdentifierResolver<UUID> tenantResolver() {
        return new CurrentTenantIdentifierResolver<UUID>() {
            @Override
            public UUID resolveCurrentTenantIdentifier() {
                RequestAttributes attrs = RequestContextHolder.getRequestAttributes();

                if (attrs instanceof ServletRequestAttributes servlet) {
                    String header = servlet.getRequest().getHeader("X-Tenant-Id");
                    if (header != null && !header.isBlank()) {
                        return UUID.fromString(header);
                    }
                }
                return DEFAULT_TENANT;
            }

            @Override
            public boolean validateExistingCurrentSessions() {
                return true;
            }
        };
    }

    @Bean
    HibernatePropertiesCustomizer tenantCustomizer(CurrentTenantIdentifierResolver<UUID> resolver) {
        return props -> props.put(AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER, resolver);
    }
}
