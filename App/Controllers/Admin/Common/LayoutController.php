<?php

namespace App\Controllers\Admin\Common;

use System\Controller as Controller;
use System\View\ViewInterface as ViewInterface;

class LayoutController extends Controller
{
    public function render(ViewInterface $view)
    {
       $data['content'] = $view;
       $data['header'] = $this->loader->controller('Admin/Common/Header')->index();
       $data['footer'] = $this->loader->controller('Admin/Common/Footer')->index();

       return $this->view->render('admin/common/layout', $data);

    }
}