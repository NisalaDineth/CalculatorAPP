//IM/2021/029

//importing necessary moduls from react and react native
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform, Dimensions, ScrollView, Modal } from 'react-native';

// Function to get initial dimensions of the screen (handles both web and mobile platforms)
const getInitialDimensions = () => {
  if (Platform.OS === 'web') {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  return Dimensions.get('window'); //mobile specific dimensions
};

export default function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [dimensions, setDimensions] = useState(getInitialDimensions());
  const [buttonSize, setButtonSize] = useState(getInitialDimensions().width * 0.2);
  const [fontSize, setFontSize] = useState(getInitialDimensions().width * 0.05);
  const [isResultDisplayed, setIsResultDisplayed] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const updatedDimensions = getInitialDimensions();
      setDimensions(updatedDimensions);

      const adjustedButtonSize = Math.min(updatedDimensions.width, updatedDimensions.height * 0.6) / 4.5;
      setButtonSize(adjustedButtonSize);

      const adjustedFontSize = adjustedButtonSize * 0.25;
      setFontSize(adjustedFontSize);
    };

    if (Platform.OS === 'web') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const MAX_INPUT_LENGTH = 20;

  const handlePress = (value) => {
    const operators = ['+', '-', '×', '÷'];

    if (value === '=') {
      try {
        // Check for division by 0 scenarios
        if (input.includes('÷0')) {
          if (input === '0÷0') {
            setResult('Cannot divide by zero'); // Custom message for 0 ÷ 0
          } else {
            setResult('Cannot divide by zero'); // Custom message for any number ÷ 0
          }
          setIsResultDisplayed(true);
          return;
        }

        // Evaluate the expression for other cases
        const calculation = eval(input.replace('×', '*').replace('÷', '/'));
        setResult(calculation.toString());
        setIsResultDisplayed(true);
        setHistory([...history, { input, result: calculation.toString() }]);
      } catch (error) {
        setResult('Error');
        setIsResultDisplayed(true);
      }
    } else if (value === 'C') {
      setInput('');
      setResult('');
      setIsResultDisplayed(false);
    } else if (value === '⌫') {
      if (isResultDisplayed) {
        // If result is displayed, clear both input and result
        setInput('');
        setResult('');
        setIsResultDisplayed(false);
      } else {
        // If result is not displayed, remove the last character from input
        setInput(input.slice(0, -1));
        setIsResultDisplayed(false);
      }
    } else if (value === 'History') {
      setShowHistoryModal(true);
    } else if (value === '%') {
      if (input) {
        const percentage = parseFloat(input);
        setInput((percentage / 100).toString());
        setResult((percentage / 100).toString());
        setIsResultDisplayed(true);
      }
    } else {
      if (input.length >= MAX_INPUT_LENGTH && !isResultDisplayed) {
        return;
      }

      if (isResultDisplayed) {
        if (operators.includes(value)) {
          setInput(result + value);
        } else {
          setInput(value === '.' ? '0.' : value);
        }
        setResult('');
        setIsResultDisplayed(false);
      } else {
        const lastChar = input[input.length - 1];

        if (operators.includes(value)) {
          if (!input || operators.includes(lastChar)) {
            // Prevent consecutive operators
            return;
          }
        }

        if (value === '.') {
          const lastNumber = input.split(/[\+\-\×\÷]/).pop();
          if (lastNumber.includes('.')) return;
          if (!lastNumber) {
            setInput(input + '0.');
          } else {
            setInput(input + value);
          }
        } else {
          setInput(input + value);
        }
      }
    }
  };

  const getButtonStyle = (btn) => {
    if (btn === 'C') return [styles.button, styles.ClearButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }];
    if (['+', '-', '×', '÷'].includes(btn)) return [styles.button, styles.OperatorButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }];
    return [styles.button, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }];
  };

  const getTextStyle = (btn) => {
    const baseStyle = [styles.buttonText, { fontSize: buttonSize * 0.4 }];
    if (btn === '⌫') return [...baseStyle, styles.redText];
    if (btn === '=') return [...baseStyle, styles.equalText];
    if (btn === 'History') return [...baseStyle, { fontSize: buttonSize * 0.2 }];
    return baseStyle;
  };

  return (
    <SafeAreaView style={[styles.container, { height: dimensions.height }]}>
      <View style={styles.screen}>
        <Text style={[styles.result, { fontSize: fontSize * 1.8 }]}>
          {result ? result : input}
        </Text>
        {result && (
          <Text style={[styles.input, { fontSize: fontSize * 1.2, color: '#aaaaaa' }]}>
            {input}
          </Text>
        )}
      </View>

      <View style={styles.buttons}>
        {[['History', '%', '⌫', 'C'], ['7', '8', '9', '×'], ['4', '5', '6', '÷'], ['1', '2', '3', '-'], ['.', '0', '=', '+']].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn) => (
              <TouchableOpacity key={btn} style={getButtonStyle(btn)} onPress={() => handlePress(btn)}>
                <Text style={getTextStyle(btn)}>{btn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Modal for displaying history */}
      <Modal visible={showHistoryModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>History</Text>
            <ScrollView style={styles.historyList}>
              {history.length > 0 ? (
                history.map((item, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Text style={styles.historyText}>
                      {item.input} = {item.result}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.historyText}>No history available</Text>
              )}
            </ScrollView>

            {/* Clear History Button */}
            <TouchableOpacity
              onPress={() => setHistory([])}
              style={styles.clearHistoryButton}
            >
              <Text style={styles.clearHistoryButtonText}>Clear History</Text>
            </TouchableOpacity>

            {/* Close History Button */}
            <TouchableOpacity onPress={() => setShowHistoryModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    paddingBottom: 0,
  },
  screen: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
  },
  input: {
    color: '#505050',
  },
  result: {
    color: '#ffffff',
    marginBottom: 10,
  },
  buttons: {
    flex: 3,
    justifyContent: 'space-evenly',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: '#222222',
  },
  ClearButton: {
    backgroundColor: '#4CAF50',
  },
  OperatorButton: {
    backgroundColor: '#111111',
    borderWidth: 0.2,
    borderColor: '#FFD700',
  },
  buttonText: {
    color: '#fff',
  },
  redText: {
    color: '#FF0000',
  },
  equalText: {
    color: '#4CAF50',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    paddingVertical: 5,
  },
  historyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearHistoryButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  clearHistoryButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});
