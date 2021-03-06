<?php
$conn = require '../php/db_connect.php';

$course_id = filter_input(INPUT_GET, 'id');
$course_lang = filter_input(INPUT_GET, 'lang');

$tab = filter_input(INPUT_GET, 'tab');

if ($tab == "") {
  $tab = "participants";
}

?>

<section class='container'>
  <ul class="nav nav-tabs">
    <li<?php echo $tab=='participants' ? ' class="active"' : '' ?>><a href="?id=<?php echo $course_id ?>&lang=<?php echo $course_lang ?>&tab=participants">Participants</a></li>
    <li<?php echo $tab=='feedback' ? ' class="active"' : '' ?>><a href="?id=<?php echo $course_id ?>&lang=<?php echo $course_lang ?>&tab=feedback">Feedback</a></li>
    <li<?php echo $tab=='activity' ? ' class="active"' : '' ?>><a href="?id=<?php echo $course_id ?>&lang=<?php echo $course_lang ?>&tab=activity">Activity</a></li>
  </ul>

  <div class='container'>
    <?php include("courseanalytics_tab_".$tab.".php") ?>
  </div>
</section>
