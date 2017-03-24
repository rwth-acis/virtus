<?php

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

$conn = require '../php/db_connect.php';

// Get input data from form
$course_id = filter_input(INPUT_GET, "course_id", FILTER_VALIDATE_INT);
$course_lang = filter_input(INPUT_GET, "course_lang");
$name = filter_input(INPUT_POST, 'name');
$points = filter_input(INPUT_POST, 'points');
$startdate = filter_input(INPUT_POST, 'startdate');
$description = filter_input(INPUT_POST, 'description');

// Create database-entry
$stmt = $conn->prepare("INSERT INTO course_units (title, lang, points, start_date, description)
                             VALUES (:name, :lang, :points, :startdate, :description)");
$stmt->bindParam(":name", $name, PDO::PARAM_STR);
$stmt->bindParam(":lang", $course_lang, PDO::PARAM_STR);  // course unit inherits course language
$stmt->bindParam(":points", $points, PDO::PARAM_INT);
$stmt->bindParam(":startdate", $startdate, PDO::PARAM_STR);
$stmt->bindParam(":description", $description, PDO::PARAM_STR);

$success = $stmt->execute();
if (!$success) {
    print_r($stmt->errorInfo());
    die("Error saving course unit.");
}

$course_unit_id = $conn->lastInsertId();
echo "course id: " . $course_id;
echo "course lang: " . $course_lang;
echo "cuid: " . $course_unit_id;

$stmt2 = $conn->prepare("INSERT INTO course_to_unit (course_id, unit_id) VALUES (:course_id, :cu_id)");
$stmt2->bindParam(":course_id", $course_id);
$stmt2->bindParam(":cu_id", $course_unit_id);

// TODO add for other translations ?!?

$success = $stmt2->execute();
if (!$success) {
    print_r($stmt2->errorInfo());
    die("Error connecting course unit to course.");
}

// After creating a course, the user is redirected to the edit page. The reason
// for this is, that it is not possible to add models on addcourse.php. But the user
// can add models on editcourse.php
header("Location: ../views/editcourse.php?id=$course_id&lang=$course_lang");
?>
