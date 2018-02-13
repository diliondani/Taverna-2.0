package taverna

import (
	"html/template"
	"net/http"

	"google.golang.org/appengine/log"

	"google.golang.org/appengine"
)

// PageData represents the data passed to the page template
type PageData struct {
	HostName string
	Lang     string
}

var tpl *template.Template

func init() {
	tpl = template.Must(template.ParseGlob("templates/*.gohtml"))
	http.HandleFunc("/", root)
}

func root(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	hn, _ := appengine.ModuleHostname(c, "", "", "")
	log.Debugf(c, "%v", hn)
	if pusher, ok := w.(http.Pusher); ok {
		// Push is supported.
		log.Debugf(c, "Pusher is available %v", pusher)
	}
	if hn == "localhost:8080" {
		hn = "https://localhost"
	}

	pd := PageData{hn, "en"}
	tpl.ExecuteTemplate(w, "index.gohtml", pd)
}
