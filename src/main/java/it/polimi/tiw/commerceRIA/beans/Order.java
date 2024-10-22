package it.polimi.tiw.commerceRIA.beans;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

public class Order implements java.io.Serializable{
	
	private int orderID;
	private ArrayList<Integer> itemIDs;
	private int supplierID;
	private String supplierName;
	private String date;
	private ArrayList<Integer> itemAmounts;
	private ArrayList<Integer> prices;
	private String userAddress;
	private ArrayList<String> itemNames;
	private int shipmentCost;
	
	public int getOrderID() {
		return orderID;
	}
	
	public void setOrderID(int orderID) {
		this.orderID = orderID;
	}
	
	public String getDate() {
		return date;
	}
	
	public void setDate(Date date) {
		SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyy");
		sdf.format(date);
		this.date = sdf.format(date);
	}

	public ArrayList<Integer> getItemIDs() {
		return itemIDs;
	}

	public void setItemIDs(ArrayList<Integer> itemIDs) {
		this.itemIDs = itemIDs;
	}

	public String getSupplierName() {
		return supplierName;
	}

	public void setSupplierName(String supplierName) {
		this.supplierName = supplierName;
	}

	public ArrayList<Integer> getItemAmounts() {
		return itemAmounts;
	}

	public void setItemAmounts(ArrayList<Integer> itemAmounts) {
		this.itemAmounts = itemAmounts;
	}

	public ArrayList<Integer> getPrices() {
		return prices;
	}

	public void setPrices(ArrayList<Integer> prices) {
		this.prices = prices;
	}

	public String getUserAddress() {
		return userAddress;
	}

	public void setUserAddress(String userAddress) {
		this.userAddress = userAddress;
	}

	public ArrayList<String> getItemNames() {
		return itemNames;
	}

	public void setItemNames(ArrayList<String> itemNames) {
		this.itemNames = itemNames;
	}

	public int getShipmentCost() {
		return shipmentCost;
	}

	public void setShipmentCost(int shipmentCost) {
		this.shipmentCost = shipmentCost;
	}

	public int getSupplierID() {
		return supplierID;
	}

	public void setSupplierID(int supplierID) {
		this.supplierID = supplierID;
	}
}
