package com.example.ecom.dto;

import java.time.LocalDate;

public class OrderUpdateRequest {

    private String status;
    private LocalDate deliveryDate;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDate deliveryDate) {
        this.deliveryDate = deliveryDate;
    }
}
