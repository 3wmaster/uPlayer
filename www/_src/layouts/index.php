<?

    function render ($layer,$vars=false){
		if (gettype ($vars) == 'array') extract($vars);
		else $var = $vars;
		ob_start();
		require_once(dirname(__FILE__).'/views/'.$layer);
		$content=ob_get_contents();
		ob_end_clean();
		return $content;
	}

    function branding($name){
        $data['html'] = render('illumination/'.$name.'/site.php');
        $data['css'] = '<link rel="stylesheet" href="/static/css/illumination/'.$name.'/main.css" media="all" />';

        return $data;
    }

	$uri = explode('/', $_SERVER['REQUEST_URI']);

	$headers = getallheaders();

    $controller = $uri[3] ? $uri[3] : 'index';
    $controller =  explode ('?', $controller);
    $controller = $controller[0];

    /* Все страницы */
    $pages = Array(
        'film-trailers' => Array(
            'title' => 'Фильм - трейлеры',
            'desc' => '
                        Если какой-либо блок под видео отсутствует - не выводим его.<br />
                        Если отзывов нет - блок меняется на призыв написать отзыв.<br />
                        Нужно заготовить вопросы, призывающие написать отзыв, и показывать их рандомно<br />
                        Если нечего выводить - добавляем класс  "filmMore-nothing"'
        )
    );

    /* Выносим, чтобы не повторять в каждом контроллере */
    $page = Array();

    //title
    $page['title'] =  $pages[$controller]['title'];

    //description
    $page['desc'] =  $pages[$controller]['desc'];

	header('Content-type: text/html; charset=utf-8');
	require_once (dirname(__FILE__) . '/controllers/' . $controller . '.php');

?>
		
						