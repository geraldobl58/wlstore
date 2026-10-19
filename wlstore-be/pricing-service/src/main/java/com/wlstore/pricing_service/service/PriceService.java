package com.wlstore.pricing_service.service;

import com.wlstore.pricing_service.model.Price;

public interface PriceService {
    Price definePrice(String sku, long amountCents, Long originalAmountCents);
}
