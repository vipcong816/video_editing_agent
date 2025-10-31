import logging

class AppLogger:
    def __init__(self, moduleName, logfile=None):
        self._logger = logging.getLogger(moduleName)
        fmt = "%(asctime)-15s %(levelname)s %(filename)s %(lineno)d %(message)s"
        formatter = logging.Formatter(fmt)
        self._logger.handlers.clear()  # 清除旧的handler，防止重复输出

        if logfile:
            handler = logging.FileHandler(logfile)
        else:
            handler = logging.StreamHandler()  # 输出到终端

        handler.setFormatter(formatter)
        self._logger.addHandler(handler)
        self._logger.setLevel(logging.INFO)

        self.warning = self._logger.warning
        self.error = self._logger.error
        self.info = self._logger.info
        self.debug = self._logger.debug