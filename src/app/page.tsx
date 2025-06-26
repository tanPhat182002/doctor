'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Shield, 
  Clock, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight,
  Stethoscope,
  Award,
  Users,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const doctors = [
    {
      id: 1,
      name: "BS. Nguyễn Văn An",
      specialty: "Bác sĩ thú y chính",
      experience: "15 năm kinh nghiệm",
      image: "👨‍⚕️",
      description: "Chuyên gia về phẫu thuật và điều trị nội khoa cho chó mèo",
      achievements: ["Thạc sĩ Thú y", "Chứng chỉ phẫu thuật quốc tế", "500+ ca phẫu thuật thành công"]
    },
    {
      id: 2,
      name: "BS. Trần Thị Bình",
      specialty: "Bác sĩ thú y",
      experience: "8 năm kinh nghiệm",
      image: "👩‍⚕️",
      description: "Chuyên về chăm sóc sức khỏe thú cưng nhỏ và điều trị da liễu",
      achievements: ["Bác sĩ Thú y", "Chuyên khoa Da liễu", "Chứng chỉ Dinh dưỡng thú cưng"]
    },
    {
      id: 3,
      name: "BS. Lê Minh Cường",
      specialty: "Bác sĩ thú y",
      experience: "12 năm kinh nghiệm",
      image: "👨‍⚕️",
      description: "Chuyên gia về chẩn đoán hình ảnh và điều trị cấp cứu",
      achievements: ["Thạc sĩ Thú y", "Chứng chỉ X-quang", "Chuyên gia cấp cứu"]
    }
  ]

  const services = [
    {
      icon: <Stethoscope className="h-8 w-8" />,
      title: "Khám tổng quát",
      description: "Kiểm tra sức khỏe định kỳ và chẩn đoán bệnh cho thú cưng",
      color: "bg-blue-500"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Phẫu thuật",
      description: "Phẫu thuật chuyên nghiệp với trang thiết bị hiện đại",
      color: "bg-red-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Tiêm phòng",
      description: "Chương trình tiêm phòng đầy đủ theo lịch khuyến cáo",
      color: "bg-green-500"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Cấp cứu 24/7",
      description: "Dịch vụ cấp cứu thú cưng 24 giờ trong các trường hợp khẩn cấp",
      color: "bg-orange-500"
    }
  ]

  const testimonials = [
    {
      name: "Chị Nguyễn Lan",
      pet: "Mèo Miu",
      content: "Bác sĩ rất tận tâm và chuyên nghiệp. Miu được chăm sóc rất tốt!",
      rating: 5
    },
    {
      name: "Anh Trần Minh",
      pet: "Chó Lucky",
      content: "Phòng khám sạch sẽ, bác sĩ giải thích rõ ràng. Lucky khỏe mạnh trở lại!",
      rating: 5
    },
    {
      name: "Chị Lê Hoa",
      pet: "Thỏ Bông",
      content: "Dịch vụ tuyệt vời, giá cả hợp lý. Sẽ quay lại lần sau!",
      rating: 5
    }
  ]

  const stats = [
    { number: "5000+", label: "Thú cưng được chăm sóc", icon: <Heart className="h-6 w-6" /> },
    { number: "15+", label: "Năm kinh nghiệm", icon: <Award className="h-6 w-6" /> },
    { number: "3", label: "Bác sĩ chuyên nghiệp", icon: <Users className="h-6 w-6" /> },
    { number: "24/7", label: "Hỗ trợ cấp cứu", icon: <Clock className="h-6 w-6" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
                <Heart className="h-4 w-4 mr-2" />
                Chăm sóc thú cưng chuyên nghiệp
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Phòng Khám Thú Y
              <span className="block text-yellow-300">PetCare</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Đội ngũ bác sĩ thú y giàu kinh nghiệm, trang thiết bị hiện đại, 
              chăm sóc sức khỏe toàn diện cho thú cưng của bạn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/admin">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  Đặt lịch khám ngay
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
                <Phone className="mr-2 h-5 w-5" />
                Hotline: 1900-1234
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Animation Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            🐕
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-pulse">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            🐱
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-bounce delay-300">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
            🐰
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center transform transition-all duration-500 delay-${index * 100} ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Dịch Vụ Chuyên Nghiệp
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cung cấp đầy đủ các dịch vụ chăm sóc sức khỏe cho thú cưng
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`} style={{animationDelay: `${index * 200}ms`}}>
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${service.color} text-white rounded-full mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Đội Ngũ Bác Sĩ Chuyên Nghiệp
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những bác sĩ thú y giàu kinh nghiệm, tận tâm với nghề
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor, index) => (
              <Card key={doctor.id} className={`group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`} style={{animationDelay: `${index * 300}ms`}}>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {doctor.image}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
                    <Badge variant="secondary" className="mb-2">{doctor.specialty}</Badge>
                    <p className="text-sm text-blue-600 font-medium">{doctor.experience}</p>
                  </div>
                  <p className="text-gray-600 mb-4 text-center">{doctor.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">Thành tích:</h4>
                    {doctor.achievements.map((achievement, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <Star className="h-3 w-3 text-yellow-500 mr-2 flex-shrink-0" />
                        {achievement}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Khách Hàng Nói Gì Về Chúng Tôi
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Những phản hồi chân thực từ khách hàng
          </p>
          
          <div className="relative">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-8">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl lg:text-2xl mb-6 leading-relaxed">
                   &ldquo;{testimonials[currentTestimonial].content}&rdquo;
                 </blockquote>
                <div className="text-lg">
                  <div className="font-semibold">{testimonials[currentTestimonial].name}</div>
                  <div className="opacity-80">Chủ của {testimonials[currentTestimonial].pet}</div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Sẵn Sàng Chăm Sóc Thú Cưng Của Bạn?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Đặt lịch khám ngay hôm nay để được tư vấn miễn phí
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg">
                <Calendar className="mr-2 h-5 w-5" />
                Đặt lịch ngay
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg">
              <Phone className="mr-2 h-5 w-5" />
              Gọi tư vấn
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">PetCare Clinic</h3>
              <p className="text-gray-300 mb-4">
                Phòng khám thú y uy tín, chăm sóc thú cưng chuyên nghiệp
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  📘
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  📱
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Dịch vụ</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Khám tổng quát</li>
                <li>Phẫu thuật</li>
                <li>Tiêm phòng</li>
                <li>Cấp cứu 24/7</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  1900-1234
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  info@petcare.vn
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  123 Đường ABC, Quận 1, TP.HCM
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Giờ làm việc</h4>
              <div className="space-y-2 text-gray-300">
                <div>Thứ 2 - Thứ 6: 8:00 - 20:00</div>
                <div>Thứ 7 - CN: 8:00 - 18:00</div>
                <div className="text-yellow-400 font-medium">Cấp cứu: 24/7</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PetCare Clinic. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
