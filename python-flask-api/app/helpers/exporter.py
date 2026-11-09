import pdfkit
from os import path
from flask import request, render_template, send_file
from app import config, excel

# export table records in different formats [pdf, excel, csv, html]
def export(records, columns=None, view_name=None, file_name=None, sheet_name="Sheet 1"):
    format = request.args.get("export") # get export format from query path

    if format == "print":
        return render_template(view_name, records=records)
    elif format == "pdf":
        html = render_template(view_name, records=records)
        pdf_config = pdfkit.configuration(wkhtmltopdf=config.WKHTMLTOPDF_BIN_PATH)
        pdf_file_name = path.join(config.PDF_DIR_PATH, file_name + ".pdf")
        pdfkit.from_string(html, pdf_file_name, configuration=pdf_config)
        return send_file(pdf_file_name, as_attachment=True)
    elif format == "excel":
        return excel.make_response_from_query_sets(records, columns, "xlsx", file_name=file_name, dest_sheet_name=sheet_name)
    elif format == "csv":
        return excel.make_response_from_query_sets(records, columns, "csv", file_name=file_name)
