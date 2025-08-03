#include "Dummy.hpp"
#include <iostream>

namespace HylozoaUi {
void Dummy::helloWorld()
{
    std::cout << "Hello world from Hylozoa ui Dummy." << std::endl;
}
int Dummy::returnInt(int i)
{
    return i;
}
}