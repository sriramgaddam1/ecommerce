package com.example.ecom.dto;

public class PaymentMethodResponse {
    private Long id;
    private String cardholderName;
    private String cardNumber;
    private String cardType;
    private String expiryMonth;
    private String expiryYear;
    private boolean isDefault;

    public PaymentMethodResponse() {
    }

    public PaymentMethodResponse(Long id, String cardholderName, String cardNumber, String cardType,
                                String expiryMonth, String expiryYear, boolean isDefault) {
        this.id = id;
        this.cardholderName = cardholderName;
        this.cardNumber = cardNumber;
        this.cardType = cardType;
        this.expiryMonth = expiryMonth;
        this.expiryYear = expiryYear;
        this.isDefault = isDefault;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCardholderName() {
        return cardholderName;
    }

    public void setCardholderName(String cardholderName) {
        this.cardholderName = cardholderName;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    public String getExpiryMonth() {
        return expiryMonth;
    }

    public void setExpiryMonth(String expiryMonth) {
        this.expiryMonth = expiryMonth;
    }

    public String getExpiryYear() {
        return expiryYear;
    }

    public void setExpiryYear(String expiryYear) {
        this.expiryYear = expiryYear;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }
}
