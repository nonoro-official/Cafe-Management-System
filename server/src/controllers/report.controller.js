import { asyncHandler } from '../utilities/asyncHandler.js';
import { sendSuccess } from '../utilities/apiResponse.js';
import { reportService } from '../services/report.service.js';

export const getSalesReport = asyncHandler(async (req, res) => {
  const report = await reportService.getSalesReport(req.query);
  sendSuccess(res, { data: report });
});

export const getTopProducts = asyncHandler(async (req, res) => {
  const products = await reportService.getTopProducts(req.query);
  sendSuccess(res, { data: products });
});

export const getSalesTrend = asyncHandler(async (req, res) => {
  const trend = await reportService.getSalesTrend(req.query);
  sendSuccess(res, { data: trend });
});

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const overview = await reportService.getDashboardOverview();
  sendSuccess(res, { data: overview });
});
