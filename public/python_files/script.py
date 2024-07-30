import PyPDF2
import os
from pikepdf import Pdf, PdfImage, Name

def extract_hyperlinks(pdf_file_path):
    try:
        unique_hyperlinks = set()
        with open(pdf_file_path, 'rb') as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            for page_num, page in enumerate(pdf_reader.pages):
                # Get the annotations (hyperlinks) on the page, if any
                annotations = page.get('/Annots', [])
                
                for annotation in annotations:
                    annotation_dict = annotation.get_object()
                    
                    # Check if the annotation is a hyperlink
                    if '/A' in annotation_dict and '/URI' in annotation_dict['/A']:
                        link_url = annotation_dict['/A']['/URI']
                        link_rect = annotation_dict['/Rect']
                        
                        # Print the link URL and its position on the page
                        # print(f'Link URL: {link_url}')
                        unique_hyperlinks.add((link_url))
                        # print(f'Link Position: {link_rect}')
        current_working_directory = os.getcwd()
        files_path = os.path.join(current_working_directory, 'public', 'raw', 'links.txt')
        with open(files_path, 'w') as file:
            for link in unique_hyperlinks:
                file.write(f'Link: {link}\n')
    except Exception as e:
        print(f'An error occurred: {e}')


def extracting_images(pdf_file_path, output_folder):
    """
    Method for extracting images from a pdf file
    """
    example = Pdf.open(pdf_file_path)
    # print(f"Length of example pdf: {len(example.pages)}")
    a = 0
    for page_number, page in enumerate(example.pages):
        # print(f"PageNumber: {page_number}")
        list_keys = list(page.images.keys())

        if not list_keys:
            # print("No images found on this page.")
            continue

        for key in list_keys:
            raw_image = page.images[key]
            pdf_image = PdfImage(raw_image)
            pdf_image.extract_to(fileprefix=f"{output_folder}/{key}{a}")
            a += 1
    print("Done")


def main():
    """
    Main Function
    """
    current_working_directory = os.getcwd()
    files_path = os.path.join(current_working_directory, 'public', 'files')
    all_files_and_dirs = os.listdir(files_path)
    pdf_file_path = ""
    files = [f for f in all_files_and_dirs if os.path.isfile(os.path.join(files_path, f))]
    if files:
        file = files[0]
        pdf_file_path = os.path.join(files_path, file)
    pdf_file = open(pdf_file_path, 'rb')
    read_pdf = PyPDF2.PdfReader(pdf_file)
    combined_content = ""
    for page_number, page in enumerate(read_pdf.pages):
        page = read_pdf.pages[page_number]
        page_content = page.extract_text()
        combined_content += page_content

    output_folder = os.path.join(current_working_directory, 'public', 'images')

    extracting_images(pdf_file_path, output_folder)
    extract_hyperlinks(pdf_file_path)

    # Print the combined content
    print(combined_content.encode('utf-8'))

if __name__ == "__main__":
    main()
