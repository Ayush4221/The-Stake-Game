import { useEffect, useRef, useState } from "react";
import { BallManager } from "../game/classes/BallManager";
import axios from "axios";
import { Button } from "../components/ui";
import { baseURL } from "../utils";
import { ToastContainer, toast ,Bounce } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
const multipliers = [
  16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16
];

export function Game() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ballManager, setBallManager] = useState<BallManager>();
  const [multiplier, setMultiplier] = useState<number | null>(null); // State for the multiplier (box number)
  const [betAmount, setBetAmount] = useState<number>(); // State for the bet amount
  const [result, setResult] = useState<number>(0); // State for the result
  const canvasRef = useRef<any>();

  useEffect(() => {
    if (canvasRef.current) {
      const ballManager = new BallManager(
        canvasRef.current as unknown as HTMLCanvasElement,
        (boxNumber) => {
          updateResult(boxNumber);
        }
      );
      setBallManager(ballManager);
    }
  }, [canvasRef]);

  const updateResult = (boxNumber: number) => {
    const currentMultiplier = multipliers[boxNumber] || 1;
    setMultiplier(currentMultiplier);
    console.log(boxNumber)
    if (inputRef.current != null && inputRef.current?.value != null) {
      console.log(result, currentMultiplier, Number(inputRef.current?.value))
      setResult((prevResult) => currentMultiplier * prevResult);
    }
  }
  const confirmContinue = () => {
    return new Promise((resolve) => {
      const handleConfirm = () => {
        resolve(true);
        if (inputRef.current) {
          inputRef.current.disabled = false;
        }
        console.log("Enter the new amount")

        toast.dismiss();
      };
      const handleCancel = () => {
        resolve(false);
        toast.dismiss();
      };

      toast(
        
        <div>
          <p>Your result amount is 1. Do you want to continue?</p>
          <button onClick={handleConfirm} className="mr-2 px-3 py-1 bg-green-500 text-white rounded">
            Yes
          </button>
          <button onClick={handleCancel} className="px-3 py-1 bg-red-500 text-white rounded">
            No
          </button>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        }
      );
    });
  };
  const addBallHandler = async () => {
    if (result < 1) {
      console.log(result)
      await confirmContinue();

      return;
    }
    try {
      const response = await axios.post(`${baseURL}/game`, {
        data: 1,
      });
      if (ballManager) {
        const boxNumber = response.data.point; // Box number where the ball landed
        ballManager.addBall(response.data.point); // Add ball without startX

        const currentMultiplier = multipliers[boxNumber] || 1; // Get the multiplier for the box number
        console.log("Box Number (from server):", boxNumber); // Debugging: Check the box number
        console.log("Multiplier Value (from array):", currentMultiplier); // Debugging: Check the multiplier value

        setMultiplier(currentMultiplier);

        // Update the result
        // setResult(prevResult => prevResult + (currentMultiplier * betAmount));
      }
      if (inputRef.current) {
        inputRef.current.disabled = true;
      }
    } catch (error) {
      console.error("Error adding ball:", error);
      toast('🦄 Wow so easy!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
  };

  return (
    <div className="relative flex flex-col lg:flex-row items-center justify-center">
     <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <canvas ref={canvasRef} width="800" height="800"></canvas>
      <div className="flex flex-col items-center">
        <input
          ref={inputRef}
          type="text"
          value={betAmount}
          onChange={(e) => {
            setBetAmount(Number(e.target.value));
            setResult(Number(e.target.value)); // Reset result on new bet amount input
          }}
          placeholder="Enter your bet amount"
          className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button className="px-10 mb-4" onClick={addBallHandler}>
          Add ball
        </Button>
        {result !== null && (
          <div className="mt-4 p-2 bg-green-500 text-white rounded-lg shadow-lg">
            Result: {result.toFixed(2)} Rs
          </div>
        )}
      </div>
      <div className="absolute top-4 right-4 p-2 bg-blue-500 text-white rounded-lg shadow-lg">
        Multiplier (Box): {multiplier !== null ? multiplier.toFixed(2) : 'N/A'}
      </div>
    </div>
  );
}
