package com.wlstore.pricing_service.service.impl;

import com.wlstore.pricing_service.exception.UnknownSkuException;
import com.wlstore.pricing_service.model.Price;
import com.wlstore.pricing_service.repository.KnownSkuRepository;
import com.wlstore.pricing_service.repository.PriceRepository;
import com.wlstore.pricing_service.service.PriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PriceServiceImpl implements PriceService {

    private final PriceRepository priceRepository;
    private final KnownSkuRepository knownSkuRepository;

    @Override
    @Transactional
    public Price definePrice(String sku, long amountCents, Long originalAmountCents) {
        if (!knownSkuRepository.existsBySku(sku)) {
            throw new UnknownSkuException(sku);
        }

        Instant now = Instant.now();

        priceRepository.findBySkuAndValidToIsNull(sku).ifPresent(current -> {
            current.setValidTo(now);
            priceRepository.saveAndFlush(current);
        });

        Price price = Price.builder()
                .sku(sku)
                .amountCents(amountCents)
                .originalAmountCents(originalAmountCents)
                .validFrom(now)
                .build();

        return priceRepository.saveAndFlush(price);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Price> findCurrentPrices(Collection<String> skus) {
        if (skus.isEmpty()) {
            return List.of();
        }

        return priceRepository.findBySkuInAndValidToIsNull(skus);
    }
}