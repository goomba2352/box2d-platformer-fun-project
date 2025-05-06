import http.server
import socketserver

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        super().end_headers()

    def guess_type(self, path):
        # Call the parent method, which returns ONLY the content type string
        content_type = super().guess_type(path) # Assign the single return value

        # Check if it's a .js file and if the guessed type isn't already a JS type
        # (Checking for both common JS MIME types for robustness)
        if path.lower().endswith('.js') and \
          content_type not in ('application/javascript', 'text/javascript'):
            
            original_type = content_type # Keep track of the original guess for logging
            content_type = 'application/javascript' # Force the correct type
            print(f"Overriding MIME type for {path} from '{original_type}' to '{content_type}'")

        # Return the (potentially overridden) content type
        return content_type

if __name__ == "__main__":
    PORT = 8000
    Handler = MyHTTPRequestHandler

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("Serving at port", PORT)
        httpd.serve_forever()