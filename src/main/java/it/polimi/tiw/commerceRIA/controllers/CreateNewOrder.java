package it.polimi.tiw.commerceRIA.controllers;

import java.io.IOException;
import java.sql.*;
import java.util.*;
import java.util.Date;

import javax.servlet.*;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import com.google.gson.*;

import it.polimi.tiw.commerceRIA.beans.*;
import it.polimi.tiw.commerceRIA.dao.*;

@WebServlet("/CreateNewOrder")
@MultipartConfig
public class CreateNewOrder extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	private Connection connection;

	public CreateNewOrder() {
		super();
	}

	public void init() throws ServletException {
		try {
			ServletContext context = getServletContext();
			String driver = context.getInitParameter("dbDriver");
			String url = context.getInitParameter("dbUrl");
			String user = context.getInitParameter("dbUser");
			String password = context.getInitParameter("dbPassword");
			Class.forName(driver);
			connection = DriverManager.getConnection(url, user, password);

		} catch (ClassNotFoundException e) {
			throw new UnavailableException("Can't load database driver");
		} catch (SQLException e) {
			throw new UnavailableException("Couldn't get db connection");
		}
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		try {
			UserDAO uDAO = new UserDAO(connection);
			SupplierDAO sDAO = new SupplierDAO(connection);
			OrderDAO oDAO = new OrderDAO(connection);
			String userID = request.getParameter("userID");
			String supplierID = request.getParameter("supplierID");
			String cost = request.getParameter("cost");
			String shipmentCost = request.getParameter("shipmentCost");
			String userAddress = request.getParameter("address");
			JsonArray jsonItems = JsonParser.parseString(request.getParameter("items")).getAsJsonArray();
			if (userID == null || userID.isEmpty() || supplierID == null || supplierID.isEmpty() || 
					cost == null || cost.isEmpty() || shipmentCost == null || shipmentCost.isEmpty() ||
						userAddress == null || userAddress.isEmpty() || jsonItems == null) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
			int uID = Integer.parseInt(userID);
			int sID = Integer.parseInt(supplierID);
			int c = Integer.parseInt(cost);
			int sc = Integer.parseInt(shipmentCost);
			if (!uDAO.doesUserExist(uID) || !sDAO.doesSupplierExist(sID)|| c < 0 || sc < 0) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
			ArrayList<Integer> itemIDs = new ArrayList<Integer>();
			ArrayList<Integer> itemAmounts = new ArrayList<Integer>();
			ArrayList<Integer> itemPrices = new ArrayList<Integer>();
			for(int i = 0; i < jsonItems.size(); i++) {
				int itemID = jsonItems.get(i).getAsJsonObject().get("itemID").getAsInt();
				itemIDs.add(itemID);
				int amount = jsonItems.get(i).getAsJsonObject().get("amount").getAsInt();
				itemAmounts.add(amount);
				int price = jsonItems.get(i).getAsJsonObject().get("price").getAsInt();
				itemPrices.add(price);
			}
			Calendar cal = Calendar.getInstance();
			cal.set(Calendar.HOUR_OF_DAY, 0);
			cal.set(Calendar.MINUTE, 0);
			cal.set(Calendar.SECOND, 0);
			cal.set(Calendar.MILLISECOND, 0);
			Date dateParam = null;
			dateParam = cal.getTime();
			oDAO.createOrder(itemIDs, dateParam, uID, itemAmounts, itemPrices, c, sc, sID, userAddress);
		} catch (IllegalStateException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			return;
		} catch (JsonParseException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			return;
		} catch (NumberFormatException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			return;
		} catch(ClassCastException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return;
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("ERROR! Can't connect to Database ! Retry later");
			return;
		}
	}
	
	public void destroy() {
		try {
			if (connection != null) {
				connection.close();
			}
		} catch (SQLException sqle) {
		}
	}
}
