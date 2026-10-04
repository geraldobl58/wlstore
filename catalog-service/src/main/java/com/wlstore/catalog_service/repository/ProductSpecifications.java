package com.wlstore.catalog_service.repository;

import com.wlstore.catalog_service.dto.ProductFilterDTO;
import com.wlstore.catalog_service.model.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public final class ProductSpecifications {
    private ProductSpecifications(){}

    public static Specification<Product> withFilters(com.wlstore.catalog_service.dto.ProductFilterDTO filter, Collection<UUID> categoriesIds){
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(filter.title())) {
                predicates.add(builder.like(builder.lower(root.get("title")), contains(filter.title())));
            }

            if (StringUtils.hasText(filter.brand())) {
                predicates.add(builder.like(builder.lower(root.get("brand")), contains(filter.brand())));
            }

            if (filter.status() != null) {
                predicates.add(builder.equal(root.get("status"), filter.status()));
            }

            if (filter.minPrice() != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("price").get("originalPrice"), filter.minPrice()));
            }

            if (filter.maxPrice() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("price").get("originalPrice"), filter.maxPrice()));
            }

            if (categoriesIds != null) {
                predicates.add(root.get("category").get("id").in(categoriesIds));
            }

            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static String contains(String value) {
        return "%" + value.toLowerCase() + "%";
    }
}
