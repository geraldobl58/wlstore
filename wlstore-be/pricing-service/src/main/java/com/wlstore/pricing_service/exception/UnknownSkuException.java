package com.wlstore.pricing_service.exception;

public class UnknownSkuException extends RuntimeException {

    public UnknownSkuException(String sku) {
        super("Unknown SKU: " + sku);
    }
}