<!DOCTYPE html>
<html class="no-js ">
<head>
    <meta charset="utf-8">
    <script>
        (function(){
            var html = document.documentElement,
                cls = html.className;

            //
            cls = cls.replace(/\s*no-js/, '');
            html.className = cls;
        })();
    </script>

    <title>Плеер</title>

    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width">

    <link rel="stylesheet" href="/static/css/uPlayer.css" media="all">
    <script src="/static/js/vendors/uPlayer.js?34"></script>
</head>

<body>
    <?= $page['content']  ?>
</body>
</html>