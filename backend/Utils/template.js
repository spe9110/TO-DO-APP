import fs from "fs";
import path from "path";

const __dirname = path.resolve();

/**
 * Loads an HTML template and replaces variables like {{name}}, {{email}}, {{otp}}.
 */
export const loadTemplate = (filename, variables) => {
    const filePath = path.join(__dirname, "Templates", filename);
    let template = fs.readFileSync(filePath, "utf-8");

    // Replace all variables in the template
    for (const key in variables) {
        const regex = new RegExp(`{{${key}}}`, "g");
        template = template.replace(regex, variables[key]);
    }

    return template;
};
