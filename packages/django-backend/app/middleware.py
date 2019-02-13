from urllib.request import url2pathname
from whitenoise.middleware import WhiteNoiseMiddleware


class WhiteNoisePathMiddleware(WhiteNoiseMiddleware):
    """
    Wrap WhiteNoiseMiddleware to normalise Windows paths when using finders

    DEPRECATED: Only needed if we declare STATICFILES_DIRS with prefixes in
    `settings.py`, AND are serving the files directly ourselves (as opposed
    to proxying requests to e.g. the React dev server).
    """

    def candidate_paths_for_url(self, url):
        """
        Normalise the candidate paths using urllib.request.url2pathname, in
        the same way that django.contrib.staticfiles.handlers does
        :param url:
        :return:
        """
        # Keep static prefix and root backslash, normalise rest of the url
        if url.startswith(self.static_prefix):
            norm_url = self.static_prefix + url2pathname(
                url[len(self.static_prefix) :]
            )
        elif url.startswith("/"):
            norm_url = "/" + url2pathname(url[1:])
        else:
            norm_url = url2pathname(url)
        print(url)
        print(norm_url)
        return super().candidate_paths_for_url(norm_url)
