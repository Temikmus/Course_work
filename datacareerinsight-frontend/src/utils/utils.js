// utils.js
import { numericFields } from "../components/constants";

// Проверка, является ли поле числовым
export const isNumericField = (field) => {
    return numericFields.includes(field);
};