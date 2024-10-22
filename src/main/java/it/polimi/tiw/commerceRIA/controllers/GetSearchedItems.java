package it.polimi.tiw.commerceRIA.controllers;

import java.io.IOException;
import java.sql.*;
import java.util.List;

import javax.servlet.*;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import org.apache.commons.lang.StringEscapeUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.commerceRIA.beans.Item;
import it.polimi.tiw.commerceRIA.dao.ItemDAO;

@WebServlet("/GetSearchedItems")
@MultipartConfig
public class GetSearchedItems extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public GetSearchedItems() {
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

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String keyword = null;
		keyword = StringEscapeUtils.escapeJava(request.getParameter("keyword"));
		if (keyword == null || keyword.isEmpty()) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Insert keyword");
			return;
		}
		ItemDAO iDAO = new ItemDAO(connection);
		try {
			List<Item> items = iDAO.findItemsByKeyword(keyword);
			Gson gson = new GsonBuilder()
					   .setDateFormat("yyyy MMM dd").create();
			String json = gson.toJson(items);
			response.setStatus(HttpServletResponse.SC_OK);
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(json);
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
