#include <gtest/gtest.h>
#include "Dummy/Dummy.hpp"

// Demonstrate some basic assertions.
TEST(DummyTest, BasicAssertions) {
    HylozoaUi::Dummy dm;

    EXPECT_EQ(dm.returnInt(42), 42);
}