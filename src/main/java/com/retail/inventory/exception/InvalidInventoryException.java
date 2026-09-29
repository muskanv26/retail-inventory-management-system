package com.retail.inventory.exception;

public class InvalidInventoryException extends RuntimeException {
    public InvalidInventoryException(String message) {
        super(message);
    }
}
