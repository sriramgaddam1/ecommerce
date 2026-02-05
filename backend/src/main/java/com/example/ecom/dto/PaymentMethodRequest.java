package com.example.ecom.dto;

public class PaymentMethodRequest {
    private String cardholderName;
    private String cardNumber; // Full card number (will be masked on backend)
    private String cardType;
    private String expiryMonth;
    private String expiryYear;
    private String cvv;
    private boolean isDefault;

    public PaymentMethodRequest() {
    }

    public PaymentMethodRequest(String cardholderName, String cardNumber, String cardType,
                               String expiryMonth, String expiryYear, String cvv, boolean isDefault) {
        this.cardholderName = cardholderName;
        this.cardNumber = cardNumber;
        this.cardType = cardType;
        this.expiryMonth = expiryMonth;
        this.expiryYear = expiryYear;
        this.cvv = cvv;
        this.isDefault = isDefault;
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

    public String getCvv() {
        return cvv;
    }

    public void setCvv(String cvv) {
        this.cvv = cvv;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }
}
