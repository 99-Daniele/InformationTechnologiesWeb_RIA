package it.polimi.tiw.commerceRIA.controllers;

import java.io.IOException;
import java.sql.*;
import java.util.*;

import javax.servlet.*;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.commerceRIA.beans.*;
import it.polimi.tiw.commerceRIA.dao.*;

@WebServlet("/GetShipmentCost")
@MultipartConfig
public class GetShipmentCost extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public GetShipmentCost() {
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

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String supplierID = request.getParameter("supplierID");
		String amount = request.getParameter("amount");
		String cost = request.getParameter("cost");
		if (supplierID == null || supplierID.isEmpty() || amount == null || 
				amount.isEmpty() || cost == null || cost.isEmpty()) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}
		SupplierDAO sDAO = new SupplierDAO(connection);
		try {
			int sID = Integer.parseInt(supplierID);
			int a = Integer.parseInt(amount);
			int c = Integer.parseInt(cost);
			if(a <= 0 || c < 0) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
			Integer shipmentCost = sDAO.calcShipmentCost(sID, a, c);
			response.setStatus(HttpServletResponse.SC_OK);
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(shipmentCost.toString());
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
