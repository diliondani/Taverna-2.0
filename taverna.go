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
	pd := PageData{"https://" + hn, "en"}
	tpl.ExecuteTemplate(w, "index.gohtml", pd)
}
