import type { Response } from "express";
import XLSX from "xlsx";
import incomeModel from "../models/incomeSchema.js";
import type { IIncome } from "../models/incomeSchema.js";
import getDateRange from "../utils/dataFilter.js";
import type { AuthRequest } from "../types/auth.js";

/* ---------- Types ---------- */

// Body for adding an income

type AddIncomeBody = {
  description: string;
  amount: number;
  category: string;
  date: string; // ISO date string sent by the client
};

// Body for updating an income
type UpdateIncomeBody = {
  description: string;
  amount: number;
};

// URL params for routes like /income/:id
type IdParams = { id: string };

// Basic response used by most handlers
type BasicResponse = {
  success: boolean;
  message: string;
};

// Response for GET /api/income
type GetAllIncomeResponse = {
  income?: IIncome[];
  success?: boolean;
  message?: string;
};

// Response for PUT /api/income/:id
type UpdateIncomeResponse = BasicResponse & { data?: IIncome };

// Response for GET /api/income/overview
type OverviewResponse = {
  success: boolean;
  message?: string;
  data?: {
    totalIncome: number;
    averageIncome: number;
    numberOfTransactions: number;
    recentTransactions: IIncome[];
    range: string;
  };
};

/* ---------- Controllers ---------- */

export async function addIncome(
  req: AuthRequest<{}, BasicResponse, AddIncomeBody>,
  res: Response<BasicResponse>,
): Promise<Response<BasicResponse>> {
  // 1. Make sure the auth middleware identified the user
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  const { description, amount, category, date } = req.body;

  // 2. All fields are required
  if (!description || !amount || !category || !date) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // 3. Create and save the income for this user
    const newIncome = new incomeModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });
    await newIncome.save();

    return res.status(201).json({
      success: true,
      message: "Income has been added",
    });
  } catch (error) {
    // Log the real error, send a generic message to the client
    console.error("addIncome error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

// GET /api/income  (all income for the logged-in user, newest first)
export async function getAllIncome(
  req: AuthRequest<{}, GetAllIncomeResponse>,
  res: Response<GetAllIncomeResponse>,
): Promise<Response<GetAllIncomeResponse>> {
  const userId = req.user?.id; // Get user ID

  if (!userId) {
    // Validate user
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  try {
    // find() takes a filter object, not a bare id
    const income = await incomeModel.find({ userId }).sort({ date: -1 });
    return res.json({ income });
  } catch (error) {
    console.error("getAllIncome error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

// PUT /api/income/:id

export async function updateIncome(
  req: AuthRequest<IdParams, UpdateIncomeResponse, UpdateIncomeBody>,
  res: Response<UpdateIncomeResponse>,
): Promise<Response<UpdateIncomeResponse>> {
  const userId = req.user?.id; // Get user ID
  if (!userId) {
    // Validate user
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  // Get id, amount and description
  const { id } = req.params;
  const { description, amount } = req.body;

  try {
    // findOneAndUpdate matches both the id AND the owner,
    // so users can only edit their own income
    const updatedIncome = await incomeModel.findOneAndUpdate(
      { _id: id, userId },
      { description, amount },
      { new: true, runValidators: true },
    );
    // null means no income matched this id for this user
    if (!updatedIncome) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    return res.json({
      success: true,
      message: "Income has been updated successfully",
      data: updatedIncome,
    });
  } catch (error) {
    // Catch error
    console.error("updateIncome error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

// DELETE /api/income/:id

export async function deleteIncome(
  req: AuthRequest<IdParams, BasicResponse>,
  res: Response<BasicResponse>,
): Promise<Response<BasicResponse>> {
  const userId = req.user?.id; // Get user ID

  try {
    // Only delete the income if it belongs to the logged-in user
    const income = await incomeModel.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!userId) {
      // Validate user
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    // Validate income
    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    return res.json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    console.error("deleteIncome error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

// GET /api/income/download  (Excel file of the user's income)

export async function downloadIncomeExcel(
  req: AuthRequest,
  res: Response,
): Promise<Response | void> {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });

    // Plain rows for the spreadsheet
    const plainData = income.map((inc) => ({
      Description: inc.description,
      Amount: inc.amount,
      Category: inc.category,
      Date: inc.date.toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(plainData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Income");

    // Build the file in memory so users never share a file on disk
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    }) as Buffer;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="income_details.xlsx"',
    );
    return res.send(buffer);
  } catch (error) {
    console.error("downloadIncomeExcel error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

// GET /api/income/overview?range=monthly
export async function getIncomeOverview(
  req: AuthRequest<{}, OverviewResponse>,
  res: Response<OverviewResponse>,
): Promise<Response<OverviewResponse>> {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  // req.query values can be a string, array, or object, so narrow to a string
  const range: string =
    typeof req.query.range === "string" ? req.query.range : "monthly";

  try {
    // Start and end dates for the requested period
    const { start, end } = getDateRange(range);

    const incomes = await incomeModel
      .find({ userId, date: { $gte: start, $lte: end } })
      .sort({ date: -1 });

    // Totals and averages for the period
    const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
    const numberOfTransactions = incomes.length;
    const averageIncome =
      numberOfTransactions > 0 ? totalIncome / numberOfTransactions : 0;

    // The 9 most recent transactions
    const recentTransactions = incomes.slice(0, 9);

    return res.json({
      success: true,
      data: {
        totalIncome,
        averageIncome,
        numberOfTransactions,
        recentTransactions,
        range,
      },
    });
  } catch (error) {
    console.error("getIncomeOverview error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
