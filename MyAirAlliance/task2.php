<?php
$host = "localhost:3307";
$user = "root";
$pass = ""; 
$db = "table_logs";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Помилка підключення: " . $conn->connect_error);
}

function generateFrequencyArray() {
    $numbers = [];
    for ($i = 0; $i < 100; $i++) {
        $numbers[] = rand(0, 10);
    }

    $frequency = array_fill(0, 11, 0);
    foreach ($numbers as $num) {
        $frequency[$num]++;
    }

    return $frequency;
}

$frequency = [];
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $frequency = generateFrequencyArray();

    $stmt = $conn->prepare("INSERT INTO number_frequencies (number, frequency) VALUES (?, ?)");
    foreach ($frequency as $number => $count) {
        $stmt->bind_param("ii", $number, $count);
        $stmt->execute();
    }
    $stmt->close();
}

$last = $conn->query("
    SELECT * FROM number_frequencies 
    WHERE generated_at = (
        SELECT MAX(generated_at) FROM number_frequencies
    )
    ORDER BY number ASC
");

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Variant 6 – Number Frequencies</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f0f0f0; }
        table { border-collapse: collapse; margin-top: 20px; width: 300px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
        th { background-color: #f2f2f2; }
        input[type="submit"] {
            padding: 10px 20px;
            background: #007bff;
            border: none;
            color: white;
            border-radius: 5px;
            cursor: pointer;
        }
        input[type="submit"]:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>

<h2>Frequencies of Numbers from 0 to 10</h2>

<form method="post">
    <input type="submit" value="Regenerate">
</form>

<?php if (!empty($frequency)): ?>
    <h3>Generated and Saved:</h3>
    <table>
        <tr>
            <th>Number</th>
            <th>Occurrences</th>
        </tr>
        <?php foreach ($frequency as $number => $count): ?>
            <tr>
                <td><?= $number ?></td>
                <td><?= $count ?></td>
            </tr>
        <?php endforeach; ?>
    </table>
<?php endif; ?>

</body>
</html>

<?php $conn->close(); ?>