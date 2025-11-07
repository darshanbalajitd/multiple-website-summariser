"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const summarize_controller_1 = require("../controllers/summarize.controller");
const cors_1 = __importDefault(require("cors"));
const router = (0, express_1.Router)();
// Ensure preflight requests to this route return quickly with CORS headers
// run the cors middleware explicitly for this route so the response includes the CORS headers
router.options('/', (0, cors_1.default)(), (req, res) => res.sendStatus(204));
router.post('/', summarize_controller_1.summarizeController);
exports.default = router;
``;
