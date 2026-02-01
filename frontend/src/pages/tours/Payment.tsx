import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    // Lấy dữ liệu từ query parameters
    const tourId = searchParams.get("tourId");
    const price = searchParams.get("price");
    const people = searchParams.get("people");
    const date = searchParams.get("date");
    const tourName = searchParams.get("tourName");

    if (tourId && price && people && date) {
      setBookingData({
        tourId,
        price: Number(price),
        people: Number(people),
        date,
        tourName,
      });
    }
  }, [searchParams]);

  const handlePaymentMethod = (method: string) => {
    if (!bookingData) return;

    if (method === "vnpay") {
      handleVNPayPayment();
    } else if (method === "card") {
      handleCardPayment();
    } else if (method === "bank") {
      handleBankPayment();
    }
  };

  const handleVNPayPayment = async () => {
    try {
      const bookingId = searchParams.get("bookingId");
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      console.log("Payment data:", { bookingId, price: bookingData.price, userId: user.id });

      const response = await fetch("http://127.0.0.1:8000/api/payment/vnpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          price: bookingData.price,
          user_id: user.id,
        }),
      });
      const data = await response.json();
      
      console.log("Payment response:", data);
      
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert("Lỗi: " + (data.message || "Tạo link thanh toán thất bại"));
      }
    } catch (error) {
      console.error("Lỗi thanh toán VNPay:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const handleCardPayment = () => {
    alert("Phương thức thanh toán bằng thẻ sắp được cập nhật!");
  };

  const handleBankPayment = () => {
    alert("Phương thức chuyển khoản ngân hàng sắp được cập nhật!");
  };

  if (!bookingData) {
    return <p className="text-center py-20">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Thanh Toán</h1>
          <p className="text-gray-600">Chọn phương thức thanh toán của bạn</p>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Tóm tắt đặt tour
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Tour:</span>
              <span className="font-semibold text-gray-800">
                {bookingData.tourName}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Ngày khởi hành:</span>
              <span className="font-semibold text-gray-800">
                {new Date(bookingData.date).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Số người:</span>
              <span className="font-semibold text-gray-800">
                {bookingData.people} người
              </span>
            </div>

            <div className="flex justify-between items-center pt-4 bg-blue-50 px-4 py-3 rounded-lg">
              <span className="text-lg font-bold text-gray-800">
                Tổng tiền:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {bookingData.price.toLocaleString()} VND
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Chọn phương thức thanh toán
          </h3>

          <div className="space-y-4">
            {/* VNPay */}
            <button
              onClick={() => handlePaymentMethod("vnpay")}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">VNPay</p>
                    <p className="text-sm text-gray-600">
                      Thanh toán qua VNPay
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full group-hover:border-blue-500"></div>
              </div>
            </button>

            {/* Credit Card */}
            <button
              onClick={() => handlePaymentMethod("card")}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-left group opacity-50 cursor-not-allowed"
              disabled
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏦</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Thẻ Tín Dụng</p>
                    <p className="text-sm text-gray-600">
                      Visa, Mastercard (Sắp cập nhật)
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              </div>
            </button>

            {/* Bank Transfer */}
            <button
              onClick={() => handlePaymentMethod("bank")}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-left group opacity-50 cursor-not-allowed"
              disabled
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏧</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Chuyển khoản ngân hàng
                    </p>
                    <p className="text-sm text-gray-600">
                      Chuyển khoản trực tiếp (Sắp cập nhật)
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              </div>
            </button>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full mt-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
          >
            Quay lại
          </button>
        </div>

        {/* Security Info */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-semibold text-green-800">
                Thanh toán an toàn
              </p>
              <p className="text-sm text-green-700">
                Tất cả giao dịch được mã hóa và bảo vệ bằng công nghệ SSL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
