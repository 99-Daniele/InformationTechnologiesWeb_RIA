package it.polimi.tiw.commerceRIA.dao;

import java.sql.*;
import java.util.*;

import it.polimi.tiw.commerceRIA.beans.*;

public class ItemDAO {

	private Connection connection;

	public ItemDAO(Connection connection) {
		this.connection = connection;
	}
	
	public ArrayList<Item> getItemInfoByItemID(int itemID) throws SQLException {
		ArrayList<Item> items = new ArrayList<Item>();
		String query = "SELECT I.name, I.description, I.category, I.image, SI.supplierID, SI.price FROM item AS I, item_supplier AS SI WHERE I.itemID = ? AND I.itemID = SI.itemID ORDER BY SI.price";
		ResultSet result = null;
		PreparedStatement pstatement = null;
		try {
			pstatement = connection.prepareStatement(query);
			pstatement.setInt(1, itemID);
			result = pstatement.executeQuery();
			while(result.next()) {
				Item item = new Item();
				item.setItemID(itemID);
				item.setName(result.getString("I.name"));
				item.setDescription(result.getString("I.description"));
				item.setCategory(result.getString("I.category"));
				item.setImage(result.getString("I.image"));
				item.setSupplierID(result.getInt("SI.supplierID"));
				item.setPrice(result.getInt("SI.price"));
				items.add(item);
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
		return items;
	}
	
	public List<Item> findItemsByKeyword(String keyword) throws SQLException {
		List<Item> items = new ArrayList<Item>();
		String query = "SELECT I.itemID, I.name, I.description, MIN(SI.price) as price FROM item AS I, item_supplier AS SI WHERE I.itemID = SI.itemID AND (I.name LIKE '%" + keyword + "%' OR I.description LIKE '%" + keyword + "%') GROUP BY SI.itemID ORDER BY price";
		ResultSet result = null;
		Statement statement = null;
		try {
			statement = connection.createStatement();
			result = statement.executeQuery(query);
			while (result.next()) {
				Item item = new Item();
				item.setItemID(result.getInt("I.itemID"));
				item.setName(result.getString("I.name"));
				item.setDescription(result.getString("I.description"));
				item.setPrice(result.getInt("price"));
				items.add(item);
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
				if (statement != null) {
					statement.close();
				}
			} catch (Exception e2) {
				throw new SQLException(e2);
			}
		}
		return items;
	}
	
	public boolean doesItemExist(int itemID)  throws SQLException {
		String query = "SELECT * FROM item WHERE itemID = ?";
		ResultSet result = null;
		PreparedStatement pstatement = null;
		try {
			pstatement = connection.prepareStatement(query);
			pstatement.setInt(1, itemID);
			result = pstatement.executeQuery();
			if(!result.next())
				return false;
			else
				return true;
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
	
	public boolean doesItemExist(int itemID, int supplierID) throws SQLException {
		String query = "SELECT * FROM item_supplier WHERE itemID = ? and supplierID = ?";
		ResultSet result = null;
		PreparedStatement pstatement = null;
		try {
			pstatement = connection.prepareStatement(query);
			pstatement.setInt(1, itemID);
			pstatement.setInt(2, supplierID);
			result = pstatement.executeQuery();
			if(!result.next())
				return false;
			else
				return true;
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
	
	public ArrayList<Supplier> findSuppliersByItemID(int itemID) throws SQLException {
		ArrayList<Supplier> suppliers = new ArrayList<Supplier>();
		String query = "SELECT S.supplierID, S.name, S.score, S.threshold FROM item_supplier AS SI, supplier AS S WHERE SI.itemID = ? AND SI.supplierID = S.supplierID ORDER BY SI.price";
		ResultSet result = null;
		PreparedStatement pstatement = null;
		try {
			pstatement = connection.prepareStatement(query);
			pstatement.setInt(1, itemID);
			result = pstatement.executeQuery();
			while(result.next()){
				Supplier supplier = new Supplier();
				supplier.setSupplierID(result.getInt("S.supplierID"));
				supplier.setName(result.getString("S.name"));
				supplier.setScore(result.getInt("S.score"));
				supplier.setThreshold(result.getInt("S.threshold"));
				suppliers.add(supplier);			
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
		return suppliers;
	}
	
	public ArrayList<Item> getFiveRandomItems() throws SQLException{
		ArrayList<Item> randomItems = new ArrayList<Item>();
		String query = "SELECT I.itemID, I.name, I.category, MIN(SI.price) as price FROM item AS I, item_supplier AS SI WHERE category = 'telefoni' AND I.itemID = SI.itemID GROUP BY SI.itemID ORDER BY SI.price";
		ResultSet result = null;
		Statement statement = null;
		try {
			statement = connection.createStatement();
			result = statement.executeQuery(query);
			int count = 0;
			while (result.next() && count < 5) {
				Item item = new Item();
				item.setItemID(result.getInt("I.itemID"));
				item.setName(result.getString("I.name"));
				item.setCategory(result.getString("I.category"));
				item.setPrice(result.getInt("price"));
				randomItems.add(item);
				count++;
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
				if (statement != null) {
					statement.close();
				}
			} catch (Exception e2) {
				throw new SQLException(e2);
			}
		}
		return randomItems;
	}
}
