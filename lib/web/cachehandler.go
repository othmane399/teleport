/*
 * Teleport
 * Copyright (C) 2023  Gravitational, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package web

import (
	"net/http"
	"path/filepath"
	"time"

	"github.com/gravitational/teleport/lib/httplib"
)

// makeCacheHandler adds support for gzip compression for given handler.
func makeCacheHandler(handler http.Handler, etag string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// for javascript assets, we want to set an entity tag based on the version
		// of teleport. This will allow us to cache our "app.js", and validate if the file
		// should be recached based on the teleport version. A webasset will not change within
		// the same version so we can use this etag to return a 304 (Not Modified). This results in
		// only a couple hundred bytes response compared to the entire bundle js file

		// The rest of our assets like fonts can be cached between versions without issue
		if filepath.Ext(r.URL.Path) == ".js" {
			httplib.SetEntityTagCacheHeaders(w.Header(), etag)
		} else {
			httplib.SetCacheHeaders(w.Header(), time.Hour*24*365 /* one year */)
		}

		handler.ServeHTTP(w, r)
	})
}
