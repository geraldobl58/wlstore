package com.wlstore.pricing_service.service.impl;

import com.wlstore.pricing_service.model.Price;
import com.wlstore.pricing_service.repository.PriceRepository;
import com.wlstore.pricing_service.service.PriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PriceServiceImpl implements PriceService {
    private final PriceRepository priceRepository;

    @Override
    @Transactional
    public Price definePrice(String sku, long amountCents, Long originalAmountCents) {
        Instant now = Instant.now();

        priceRepository.findBySkuAndValidToIsNull(sku).ifPresent(current -> {
            current.setValidTo(now);
            priceRepository.saveAndFlush(current);
        });

        Price newPrice = Price.builder()
                .sku(sku)
                .amountCents(amountCents)
                .originalAmountCents(originalAmountCents)
                .validFrom(now)
                .build();

        return priceRepository.saveAndFlush(newPrice);
    }
}
