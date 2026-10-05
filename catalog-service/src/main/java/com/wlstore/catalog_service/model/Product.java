package com.wlstore.catalog_service.model;

import com.wlstore.catalog_service.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Table(name = "tb_product", uniqueConstraints =
@UniqueConstraint(name = "uk_product_tenant_title", columnNames = {"tenant_id", "title"}))
@Entity
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Product extends TenantEntity {
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "brand", nullable = false)
    private String brand;

    @Column(name = "image", nullable = false)
    private String image;

    @Column(name = "gallery", nullable = false)
    private List<String> gallery;

    @Column(name = "description", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
