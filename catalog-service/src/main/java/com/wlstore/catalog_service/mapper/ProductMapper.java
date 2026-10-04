package com.wlstore.catalog_service.mapper;

import com.wlstore.catalog_service.dto.CategorySummaryDTO;
import com.wlstore.catalog_service.dto.ProductRequestDTO;
import com.wlstore.catalog_service.dto.ProductResponseDTO;
import com.wlstore.catalog_service.model.Category;
import com.wlstore.catalog_service.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Product toEntity(ProductRequestDTO requestDTO);

    ProductResponseDTO toResponseDTO(Product product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateProductFromRequest(ProductRequestDTO productRequest, @MappingTarget Product product);

    default CategorySummaryDTO toCategorySummary(Category category) {
        if (category == null) {
            return null;
        }

        Deque<String> path = new ArrayDeque<>();
        for (Category current = category; current != null; current = current.getParent()) {
            path.addFirst(current.getTitle());
        }

        return new CategorySummaryDTO(category.getId(), category.getTitle(), category.getSlug(), List.copyOf(path));
    }
}
