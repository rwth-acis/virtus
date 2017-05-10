<?php
/**
 * @file confirm_registration.php
 *
 * Sets the confirmation flag in the database for a given email address
 *
 * WARNING: The following variables need to be set before calling this script:
 * $mail, $affiliation, $city, $street, $phone
 */

// Uncomment this, when using this file in combination with views/confirm_registration.php
// The mentioned combination is used to prevent upgrading account without 
// confirmation of an admin
//$mail = $_POST['mail'];

// Get DB connection
$conn = require '../php/db_connect.php';
require '../config/config.php';

// Test whether the account is already confirmed
$sql_select = "SELECT * FROM users WHERE email='" . $mail . "' AND confirmed=1";
$sth = $db->prepare($sql_select);
$sth->execute();
$user = $sth->fetchObject();
// If user is not empty, the account is already confirmed
if ($user) {
    $result = array(
        'result' => 'error',
        'mail' => $mail,
        'sql_select' => $sql_select,
        'error' => 'The account for the email address \'' . $mail . '\' is already confirmed.'
    );
} else {
    // Confirm account and also update affiliation, city, street and phone (if provided)
    $sql = "UPDATE users SET confirmed=1, affiliation='" . $affiliation . "', city='" . $city . "', street='" . $street . "', phone='" . $phone . "' WHERE email='" . $mail . "'";
    $sth = $db->prepare($sql);
    $success = $sth->execute();

    if ($success) {
        // Send a mail to the lecturer to inform that his or her account can now be used
        $mail_to = $mail;
        $subject = "V3C Lecturer Account";
        $login_link = $baseUrl;
        $message = "Hello " . $mail_to . ",\n\n" .
            "your V3C account has been upgraded to 'lecturer' version. You can now start using lecturer features by logging in at: " . $login_link . "\n\n" .
            "This mail was automatically generated by the V3C system. Please do not respond to this mail.";
        mail($mail_to, $subject, $message);

        // Create result to transmit to client. SQL is sent only for debugging
        $result = array('result' => 'ok', 'mail' => $mail, 'sql' => $sql, 'sql_select' => $sql_select);
    } else {
        $result = array(
            'result' => 'error',
            'mail' => $mail,
            'sql' => $sql,
            'sql_select' => $sql_select,
            'error' => 'Confirmation was not successful. Please try again.'
        );
    }
}

// JSON encode the return value to be transmitted to client again
echo json_encode($result);
?>
	