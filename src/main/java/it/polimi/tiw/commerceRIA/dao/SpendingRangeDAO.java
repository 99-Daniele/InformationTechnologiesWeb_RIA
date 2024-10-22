package it.polimi.tiw.commerceRIA.dao;

import java.sql.*;
import java.util.*;

import it.polimi.tiw.commerceRIA.beans.*;

public class SpendingRangeDAO {

	private Connection connection;
	
	public SpendingRangeDAO(Connection connection) {
		this.connection = connection;
	}

	public ArrayList<ArrayList<SpendingRange>> findSpendingRangesByItemID(int itemID) throws SQLException {
		ArrayList <ArrayList<SpendingRange>> spendingRanges = new ArrayList<ArrayList<SpendingRange>>();
		String query = "SELECT supplierID FROM item_supplier WHERE itemID = ? ORDER BY price";
		ResultSet result = null;
		PreparedStatement pstatement = null;
		try {
			pstatement = connection.prepareStatement(query);
			pstatement.setInt(1, itemID);
			result = pstatement.executeQuery();
			while (result.next()) {
				ArrayList<SpendingRange> spendingRange = findSpendingRangesBySupplierID(result.getInt("supplierID"));
				spendingRanges.add(spendingRange);
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
		return spendingRanges;
	}
	
	private ArrayList<SpendingRange> findSpendingRangesBySupplierID(int supplierID) throws SQLException {
		ArrayList <SpendingRange> spendingRanges = new ArrayList<SpendingRange>();
		String query = "SELECT * FROM spending_range WHERE supplierID = ? ORDER BY min";
		ResultSet result = null;
		PreparedStatement pstatement = null;
		try {
			pstatement = connection.prepareStatement(query);
			pstatement.setInt(1, supplierID);
			result = pstatement.executeQuery();
			while (result.next()) {
				SpendingRange spendingRange = new SpendingRange();
				spendingRange.setMin(result.getInt("min"));
				spendingRange.setPrice(result.getInt("price"));
				spendingRanges.add(spendingRange);
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
		return spendingRanges;
	}
	
	public int getShipmentCost(int supplierID, int amount) throws SQLException {
		String query = "SELECT * FROM spending_range WHERE supplierID = ? ORDER BY min DESC";
		ResultSet result = null;
		PreparedStatement pstatement = null;
		try {
			pstatement = connection.prepareStatement(query);
			pstatement.setInt(1, supplierID);
			result = pstatement.executeQuery();
			while (result.next()) {
				int shipmentCost = result.getInt("price");
				if(result.getInt("min") <= amount)
					return shipmentCost;
			}
			return 0;
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
	}
}
