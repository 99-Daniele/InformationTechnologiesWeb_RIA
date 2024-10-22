package it.polimi.tiw.commerceRIA.dao;

import java.sql.*;
import java.time.ZoneId;
import java.util.Date;

import it.polimi.tiw.commerceRIA.beans.Order;

import java.util.*;

public class OrderDAO {
	
	private Connection connection;

	public OrderDAO(Connection connection) {
		this.connection = connection;
	}
	
	public void createOrder(ArrayList<Integer> itemIDs, Date date, int userID, ArrayList<Integer> itemAmounts, ArrayList<Integer> itemPrices, int totalCost, int shipmentCost, int supplierID, String userAddress) throws SQLException {
		String query = "INSERT INTO orders (date, userID, cost, shipmentCost, supplierID, userAddress) VALUES(?, ?, ?, ?, ?, ?)";
		ResultSet result = null;
		Statement statement = null;
		PreparedStatement pstatement = null;
		try {
			pstatement = connection.prepareStatement(query);
			pstatement.setObject(1, date.toInstant().atZone(ZoneId.of("Europe/Rome")).toLocalDate());
			pstatement.setInt(2, userID);
			pstatement.setInt(3, totalCost);
			pstatement.setInt(4, shipmentCost);
			pstatement.setInt(5, supplierID);
			pstatement.setString(6, userAddress);
			pstatement.executeUpdate();
			query = "SELECT MAX(orderID) as orderID FROM orders";
			statement = connection.createStatement();
			result = statement.executeQuery(query);
			int orderID = 0;
			if (result.next()) {
				orderID =  result.getInt("orderID");
			}
			for(int i = 0; i < itemIDs.size(); i++) {
				query = "INSERT INTO item_order (orderID, itemID, itemAmount, itemPrice) VALUES(?, ?, ?, ?)";
				pstatement = connection.prepareStatement(query);
				pstatement.setInt(1, orderID);
				pstatement.setObject(2, itemIDs.get(i));
				pstatement.setObject(3, itemAmounts.get(i));
				pstatement.setObject(4, itemPrices.get(i));
				pstatement.executeUpdate();
			}
		} finally {
			try {
				if (pstatement != null) {
					pstatement.close();
				}
			} catch (Exception e1) {

			}
		}
	}
		
	public List<Order> findOrdersByUserID(int userID) throws SQLException {
		List<Order> orders = new ArrayList<Order>();
		String query = "SELECT orderID FROM orders WHERE userID = ? ORDER BY date DESC";
		ResultSet result = null;
		PreparedStatement pstatement = null;
		try {
			pstatement = connection.prepareStatement(query);
			pstatement.setInt(1, userID);
			result = pstatement.executeQuery();
			while(result.next()) {
				int orderID = result.getInt("orderID");
				Order order = new Order();
				order = getOrderInfoByOrderID(orderID);
				orders.add(order);
			}
		} catch (SQLException e) {
			throw new SQLException(e);
		} finally {
			try {
				if (result != null) {
					result.close();
				}
			} catch (Exception e1) {
				throw new SQLException(e1);
			}
			try {
				if (pstatement != null) {
					pstatement.close();
				}
			} catch (Exception e2) {
				throw new SQLException(e2);
			}
		}
		return orders;
	}
	
	private Order getOrderInfoByOrderID(int orderID) throws SQLException {
		Order order = new Order();
		String query = "SELECT O.orderID, IT.name, IO.itemID, S.name, O.date, IO.itemAmount, SI.price, "
				+ "O.userAddress, O.cost, O.shipmentCost, O.supplierID FROM item AS IT, item_order AS IO, "
				+ "item_supplier AS SI, orders AS O, supplier as S, user as U WHERE O.orderID = ? "
				+ "AND O.supplierID = S.supplierID AND O.userID = U.userID AND O.orderID = IO.orderID "
				+ "AND IT.itemID = IO.itemID AND SI.supplierID = O.supplierID AND IO.itemID = SI.itemID";
		ResultSet result = null;
		PreparedStatement pstatement = null;
		try {
			pstatement = connection.prepareStatement(query);
			pstatement.setInt(1, orderID);
			result = pstatement.executeQuery();
			ArrayList <Integer> itemIDs = new ArrayList<Integer>();
			ArrayList <Integer> itemAmounts = new ArrayList<Integer>();
			ArrayList <String> itemNames = new ArrayList<String>();
			ArrayList <Integer> itemPrices = new ArrayList<Integer>();
			while(result.next()) {
				itemIDs.add(result.getInt("IO.itemID"));
				itemAmounts.add(result.getInt("IO.itemAmount"));
				itemNames.add(result.getString("IT.name"));
				itemPrices.add(result.getInt("SI.price"));
				order.setOrderID(orderID);
				order.setSupplierID(result.getInt("O.supplierID"));
				order.setSupplierName(result.getString("S.name"));
				order.setDate(result.getDate("O.date"));
				order.setShipmentCost(result.getInt("O.shipmentCost"));
				order.setUserAddress(result.getString("O.userAddress"));
			}
			order.setItemIDs(itemIDs);
			order.setItemAmounts(itemAmounts);
			order.setItemNames(itemNames);
			order.setPrices(itemPrices);
		} catch (SQLException e) {
			throw new SQLException(e);
		} finally {
			try {
				if (result != null) {
					result.close();
				}
			} catch (Exception e1) {
				throw new SQLException(e1);
			}
			try {
				if (pstatement != null) {
					pstatement.close();
				}
			} catch (Exception e2) {
				throw new SQLException(e2);
			}
		}
		return order;
	}
}
