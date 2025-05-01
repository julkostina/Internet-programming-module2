<?php
session_start();

$num1 = $_SESSION['num1'] ?? 0;
$num2 = $_SESSION['num2'] ?? 0;
$operation = $_SESSION['operation'] ?? '+';
$result = $_SESSION['result'] ?? '';
$example = isset($_SESSION['num1']) ? "$num1 $operation $num2 = ?" : '?';
$currentRange = $_SESSION['range'] ?? 10;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['generate'])) {
        $operation = $_POST['operation'];
        
        $currentRange = isset($_POST['range']) ? (int)$_POST['range'] : 10;
        
        $num1 = rand(0, $currentRange);
        $num2 = rand(0, $currentRange);
        
        $_SESSION['num1'] = $num1;
        $_SESSION['num2'] = $num2;
        $_SESSION['operation'] = $operation;
        $_SESSION['range'] = $currentRange;
        
        $example = "$num1 $operation $num2 = ?";
        $result = ''; 
        $_SESSION['result'] = '';
    }
    
    if (isset($_POST['check'])) {
        $userAnswer = isset($_POST['answer']) ? (int)$_POST['answer'] : '';
        
        $correctAnswer = 0;
        switch ($operation) {
            case '+':
                $correctAnswer = $num1 + $num2;
                break;
            case '-':
                $correctAnswer = $num1 - $num2;
                break;
            case '*':
                $correctAnswer = $num1 * $num2;
                break;
        }
        
        $result = ($userAnswer == $correctAnswer) ? "✅ Right!" : "❌ Wrong!";
        $_SESSION['result'] = $result;
    }
}

?>

<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <title>Mathematical Test</title>
    <link rel="stylesheet" href="./styles.css">
</head>
<body>
    <h2>Mathematical Test</h2>
    
    <form method="post" action="">
        <div>
            <button type="submit" name="range" value="10" class="range-btn <?php echo $currentRange == 10 ? 'active' : ''; ?>">0-10</button>
            <button type="submit" name="range" value="20" class="range-btn <?php echo $currentRange == 20 ? 'active' : ''; ?>">0-20</button>
            <button type="submit" name="range" value="100" class="range-btn <?php echo $currentRange == 100 ? 'active' : ''; ?>">0-100</button>
            <button type="submit" name="range" value="150" class="range-btn <?php echo $currentRange == 150 ? 'active' : ''; ?>">0-150</button>
            <button type="submit" name="range" value="35" class="range-btn <?php echo $currentRange == 26 ? 'active' : ''; ?>">0-26</button>
            <input type="hidden" name="operation" value="<?php echo htmlspecialchars($operation); ?>">
            <input type="hidden" name="generate" value="1">
        </div>
    </form>
    
    <form method="post" action="">
        <div class="operations">
            <button type="submit" name="operation" value="+" <?php echo $operation == '+' ? 'class="active"' : ''; ?>>+</button>
            <button type="submit" name="operation" value="-" <?php echo $operation == '-' ? 'class="active"' : ''; ?>>-</button>
            <button type="submit" name="operation" value="*" <?php echo $operation == '*' ? 'class="active"' : ''; ?>>*</button>
            <input type="hidden" name="range" value="<?php echo htmlspecialchars($currentRange); ?>">
            <input type="hidden" name="generate" value="1">
        </div>
    </form>
    
    <p id="example"><?php echo $example; ?></p>
    
    <form method="post" action="" id="answer-form">
        <input type="text" id="answer" name="answer" value="">
        <button type="submit" name="check">OK</button>
        <input type="hidden" name="operation" value="<?php echo htmlspecialchars($operation); ?>">
    </form>
    
    <p id="result"><?php echo $result; ?></p>
    
    <div class="numpad">
        <button type="button" onclick="appendNumber(1)">1</button>
        <button type="button" onclick="appendNumber(2)">2</button>
        <button type="button" onclick="appendNumber(3)">3</button>
        <button type="button" onclick="appendNumber(4)">4</button>
        <button type="button" onclick="appendNumber(5)">5</button>
        <button type="button" onclick="appendNumber(6)">6</button>
        <button type="button" onclick="appendNumber(7)">7</button>
        <button type="button" onclick="appendNumber(8)">8</button>
        <button type="button" onclick="appendNumber(9)">9</button>
        <button type="button" onclick="appendNumber(0)">0</button>
        <button type="button" onclick="clearAnswer()">C</button>
    </div>
    
    <script>
        function appendNumber(num) {
            document.getElementById('answer').value += num;
        }
        
        function clearAnswer() {
            document.getElementById('answer').value = '';
        }
    </script>
</body>
</html>