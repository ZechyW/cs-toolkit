from urllib.request import url2pathname
from whitenoise.middleware import WhiteNoiseMiddleware


class WhiteNoisePathMiddleware(WhiteNoiseMiddleware):
    """
    Wrap WhiteNoiseMiddleware to normalise Windows paths when using finders
    """

    def candidate_paths_for_url(self, url):
        """
        Normalise the candidate paths using urllib.request.url2pathname, in the same
        way that django.contrib.staticfiles.handlers does
        :param url:
        :return:
        """
        # Keep static prefix, normalise rest of the url
        if url.startswith(self.static_prefix):
            url = self.static_prefix + url2pathname(
                url[len(self.static_prefix) :]
            )
        else:
            url = url2pathname(url)
        return super().candidate_paths_for_url(url)
